import uuid
from django.db import models


class Task(models.Model):
    class TaskType(models.TextChoices):
        IMAGE_RESIZE = 'image_resize', 'Image Resize'
        PDF_REPORT = 'pdf_report', 'PDF Report'
        CLEANUP = 'cleanup', 'Cleanup'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        DONE = 'done', 'Done'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task_type = models.CharField(max_length=20, choices=TaskType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    input_file = models.FileField(upload_to='inputs/', blank=True, null=True)
    result_file = models.FileField(upload_to='results/', blank=True, null=True)

    error_message = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.task_type} ({self.status}) - {self.id}"