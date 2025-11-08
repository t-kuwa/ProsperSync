require "devise/jwt/test_helpers"

module AuthHelpers
  def auth_headers(user, headers = {})
    base_headers = { "Accept" => "application/json", "Content-Type" => "application/json" }
    Devise::JWT::TestHelpers.auth_headers(base_headers.merge(headers), user)
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
