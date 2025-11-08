module Api
  module V1
    module Users
      class QuickLoginController < ApplicationController
        prepend_before_action :set_devise_mapping
        before_action :check_development_environment

        def create
          test_user = User.find_by(email: "testuser@test.com")

          unless test_user
            render json: { error: "テストユーザーが見つかりません。" }, status: :not_found
            return
          end

          sign_in(test_user, scope: :api_v1_user)

          render json: {
            user: test_user.as_json(only: %i[id name email primary_account_id]),
            token: request.env["warden-jwt_auth.token"]
          }, status: :ok
        end

        private

        def check_development_environment
          unless Rails.env.development?
            render json: { error: "このエンドポイントは開発環境でのみ利用可能です。" }, status: :forbidden
          end
        end

        def set_devise_mapping
          request.env["devise.mapping"] = Devise.mappings[:api_v1_user]
        end
      end
    end
  end
end

