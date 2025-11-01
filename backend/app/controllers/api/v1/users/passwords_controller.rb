module Api
  module V1
    module Users
      class PasswordsController < Devise::PasswordsController
        respond_to :json

        prepend_before_action :set_devise_mapping

        def create
          self.resource = resource_class.send_reset_password_instructions(password_email_params)

          if successfully_sent?(resource)
            render json: { message: "パスワードリセットメールを送信しました。" }, status: :ok
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
          end
        end

        def update
          self.resource = resource_class.reset_password_by_token(password_update_params)

          if resource.errors.empty?
            render json: { message: "パスワードを更新しました。" }, status: :ok
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
          end
        end

        private

        def password_email_params
          params.require(devise_mapping.name).permit(:email)
        end

        def password_update_params
          params.require(devise_mapping.name).permit(:reset_password_token, :password, :password_confirmation)
        end

        def set_devise_mapping
          request.env["devise.mapping"] = Devise.mappings[:api_v1_user]
        end

        def devise_mapping
          Devise.mappings[:api_v1_user]
        end

      end
    end
  end
end
