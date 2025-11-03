module Api
  module V1
    module Users
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        prepend_before_action :set_devise_mapping

        def create
          build_resource(sign_up_params)

          if resource.save
            resource.reload

            render json: {
              user: resource.as_json(only: %i[id name email primary_account_id]),
              primary_account: resource.personal_account&.as_json(only: %i[id name slug account_type])
            }, status: :created
          else
            clean_up_passwords resource
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
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
