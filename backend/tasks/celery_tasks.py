from celery import shared_task
from .models import Task


@shared_task
def process_task(task_id):
    task = Task.objects.get(id=task_id)
    task.status = Task.Status.PROCESSING
    task.save(update_fields=['status'])

    try:
        if task.task_type == Task.TaskType.IMAGE_RESIZE:
            _run_image_resize(task)
        elif task.task_type == Task.TaskType.PDF_REPORT:
            _run_pdf_report(task)
        elif task.task_type == Task.TaskType.CLEANUP:
            _run_cleanup(task)

        task.status = Task.Status.DONE
    except Exception as e:
        task.status = Task.Status.FAILED
        task.error_message = str(e)

    task.save()


def _run_image_resize(task):
    from PIL import Image
    from django.core.files.base import ContentFile
    import io

    if not task.input_file:
        raise ValueError("No input_file provided for image_resize task")

    img = Image.open(task.input_file)
    img.thumbnail((300, 300))

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    task.result_file.save(f"thumb_{task.id}.png", ContentFile(buffer.getvalue()))


def _run_pdf_report(task):
    if task.input_file:
        _run_pdf_report_from_csv(task)
    else:
        _run_pdf_report_placeholder(task)


def _run_pdf_report_from_csv(task):
    import csv
    import io
    from django.core.files.base import ContentFile
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

    task.input_file.open('rb')
    raw_bytes = task.input_file.read()
    task.input_file.close()

    text = raw_bytes.decode('utf-8-sig', errors='replace')
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    if not rows:
        raise ValueError("Uploaded CSV file is empty")

    header = rows[0]
    data_rows = rows[1:]

    MAX_ROWS = 200
    truncated = len(data_rows) > MAX_ROWS
    display_rows = data_rows[:MAX_ROWS]

    styles = getSampleStyleSheet()
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)

    elements = []
    elements.append(Paragraph(f"Report for Task {task.id}", styles['Title']))
    elements.append(Paragraph(f"Generated at: {task.created_at}", styles['Normal']))
    elements.append(Paragraph(f"Source file: {task.input_file.name}", styles['Normal']))
    elements.append(Paragraph(f"Rows: {len(data_rows)}", styles['Normal']))
    elements.append(Spacer(1, 16))

    table_data = [header] + display_rows
    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c5cff')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f7')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(table)

    if truncated:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(
            f"Note: showing first {MAX_ROWS} of {len(data_rows)} rows.",
            styles['Italic']
        ))

    doc.build(elements)
    task.result_file.save(f"report_{task.id}.pdf", ContentFile(buffer.getvalue()))


def _run_pdf_report_placeholder(task):
    from reportlab.pdfgen import canvas
    from django.core.files.base import ContentFile
    import io
    import time

    time.sleep(2)  # artificial delay for demo purposes - simulates real workload

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 750, f"Report for Task {task.id}")
    c.drawString(100, 730, f"Generated at: {task.created_at}")
    c.drawString(100, 710, "No input file was provided - this is a placeholder report.")
    c.save()

    task.result_file.save(f"report_{task.id}.pdf", ContentFile(buffer.getvalue()))


def _run_cleanup(task):
    """
    Manually-triggered cleanup: deletes every OTHER task currently on the
    dashboard (and their files). This task's own record is left alone so
    it can still report itself as done once finished.
    """
    other_tasks = Task.objects.exclude(id=task.id)

    for t in other_tasks:
        if t.input_file:
            t.input_file.delete(save=False)
        if t.result_file:
            t.result_file.delete(save=False)
    other_tasks.delete()

    task.error_message = None


@shared_task
def cleanup_old_tasks():
    """
    Runs on a schedule (via Celery beat). Deletes Task records
    (and their associated files) older than 24 hours.
    """
    from datetime import timedelta
    from django.utils import timezone

    cutoff = timezone.now() - timedelta(hours=24)
    old_tasks = Task.objects.filter(created_at__lt=cutoff)

    count = old_tasks.count()
    for t in old_tasks:
        if t.input_file:
            t.input_file.delete(save=False)
        if t.result_file:
            t.result_file.delete(save=False)
        t.delete()

    return f"Deleted {count} old task(s)"
