require "pundit"

class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers
  include Pundit::Authorization

  alias_method :authenticate_user!, :authenticate_api_v1_user!
  alias_method :current_user, :current_api_v1_user
  alias_method :user_signed_in?, :api_v1_user_signed_in?

  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  protected

  def render_not_found
    render json: { error: "リソースが見つかりません。" }, status: :not_found
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[name])
    devise_parameter_sanitizer.permit(:account_update, keys: %i[name])
  end

  def render_forbidden
    render json: { error: "権限がありません。" }, status: :forbidden
  end
end
