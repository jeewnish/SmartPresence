# ============================================================
#  Module: ALB — Application Load Balancer + HTTPS Routing
#  Matches Phase 6 of the deployment guide
# ============================================================

# ── Application Load Balancer ──────────────────────────────

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name = "${var.project_name}-alb-${var.environment}"
  }
}

# ── Target Group: Spring Boot (port 8080) ──────────────────

resource "aws_lb_target_group" "springboot" {
  name     = "${var.project_name}-api-tg-${var.environment}"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    path                = "/api/v1/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-springboot-tg-${var.environment}"
  }
}

# ── Target Group: Keycloak (port 8180) ─────────────────────

resource "aws_lb_target_group" "keycloak" {
  name     = "${var.project_name}-auth-tg-${var.environment}"
  port     = 8180
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    path                = "/realms/master"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-keycloak-tg-${var.environment}"
  }
}

# ── Register EC2 with Target Groups ───────────────────────

resource "aws_lb_target_group_attachment" "springboot" {
  target_group_arn = aws_lb_target_group.springboot.arn
  target_id        = var.ec2_instance_id
  port             = 8080
}

resource "aws_lb_target_group_attachment" "keycloak" {
  target_group_arn = aws_lb_target_group.keycloak.arn
  target_id        = var.ec2_instance_id
  port             = 8180
}

# ── HTTP Listener (redirect to HTTPS) ─────────────────────

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ── HTTPS Listener ─────────────────────────────────────────

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  # Default action — 404 for unmatched hosts
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# ── HTTPS Routing Rule: auth.domain → Keycloak ────────────

resource "aws_lb_listener_rule" "keycloak" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.keycloak.arn
  }

  condition {
    host_header {
      values = ["auth.${var.domain_name}"]
    }
  }
}

# ── HTTPS Routing Rule: api.domain → Spring Boot ──────────

resource "aws_lb_listener_rule" "springboot" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.springboot.arn
  }

  condition {
    host_header {
      values = ["api.${var.domain_name}"]
    }
  }
}
