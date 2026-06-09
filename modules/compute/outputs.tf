output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.server.id
}

output "public_ip" {
  description = "Elastic IP address of the server"
  value       = aws_eip.server.public_ip
}

output "private_ip" {
  description = "Private IP of the EC2 instance"
  value       = aws_instance.server.private_ip
}
