# frozen_string_literal: true

Devise.setup do |config|
  config.mailer_sender = "no-reply@prospersync.local"

  require "devise/orm/active_record"
  require "devise/jwt"

  config.parent_controller = "ActionController::API"
  config.navigational_formats = []
  config.skip_session_storage = [:http_auth, :params_auth]

  config.jwt do |jwt|
    jwt.secret = Rails.application.secret_key_base
    jwt.dispatch_requests = [
      ["POST", %r{^/api/v1/login$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/v1/logout$}]
    ]
    jwt.expiration_time = 1.day.to_i
  end
end
