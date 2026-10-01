variable "github_token" {
  sensitive = true
}

provider "github" {
  token = var.github_token
}

import {
  to = github_repository.staff-bjj-app
  id = "staff-bjj-app"
}

resource "github_repository" "staff-bjj-app" {
  name       = "staff-bjj-app"
  visibility = "private"
}

