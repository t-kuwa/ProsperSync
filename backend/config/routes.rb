Rails.application.routes.draw do
  get "/health", to: "health#show"

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      devise_for :users,
                 defaults: { format: :json },
                 path: "users",
                 skip: [:sessions],
                 controllers: {
                   passwords: "api/v1/users/passwords",
                   registrations: "api/v1/users/registrations"
                 }

      devise_scope :user do
        post "/login", to: "users/sessions#create", defaults: { format: :json }
        delete "/logout", to: "users/sessions#destroy", defaults: { format: :json }
      end
    end
  end
end
