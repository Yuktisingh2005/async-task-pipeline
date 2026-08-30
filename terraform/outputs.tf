output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnet_ids" {
  value = module.vpc.private_subnets
}

output "public_subnet_ids" {
  value = module.vpc.public_subnets
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}
output "s3_bucket_name" {
  value = aws_s3_bucket.media.bucket
}

output "s3_access_key_id" {
  value     = aws_iam_access_key.s3_media.id
  sensitive = true
}

output "s3_secret_access_key" {
  value     = aws_iam_access_key.s3_media.secret
  sensitive = true
}