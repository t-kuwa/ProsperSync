module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController
        respond_to :json
        prepend_before_action :set_devise_mapping

        private

        def respond_with(resource, _opts = {})
          render json: {
            user: resource,
            token: request.env["warden-jwt_auth.token"]
          }, status: :ok
        end

        def respond_to_on_destroy
          head :no_content
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
