resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "media" {
  bucket = "${var.project_name}-media-${random_id.bucket_suffix.hex}"
  tags   = { Project = var.project_name }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "media_public_read" {
  bucket = aws_s3_bucket.media.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.media.arn}/*"
      }
    ]
  })
  depends_on = [aws_s3_bucket_public_access_block.media]
}

resource "aws_iam_user" "s3_media" {
  name = "${var.project_name}-s3-media"
}

resource "aws_iam_user_policy" "s3_media" {
  name = "${var.project_name}-s3-media-policy"
  user = aws_iam_user.s3_media.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [aws_s3_bucket.media.arn, "${aws_s3_bucket.media.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_access_key" "s3_media" {
  user = aws_iam_user.s3_media.name
}