module Api
  module V1
    module Users
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        prepend_before_action :set_devise_mapping

        def create
          build_resource(sign_up_params)

          if resource.save
            render json: { user: resource }, status: :created
          else
            clean_up_passwords resource
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
          end
        end

        private

        def sign_up_params
          params.require(devise_mapping.name).permit(:name, :email, :password, :password_confirmation)
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
