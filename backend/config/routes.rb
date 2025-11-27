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
        post "/users/quick_login", to: "users/quick_login#create", defaults: { format: :json }
      end

      resources :accounts, defaults: { format: :json } do
        resources :members, only: %i[index create update destroy], defaults: { format: :json }
        resources :invitations,
                  controller: :account_invitations,
                  only: %i[index create],
                  defaults: { format: :json }
        resources :categories, only: %i[index create update destroy], defaults: { format: :json }
        resources :expenses, only: %i[index show create update destroy], defaults: { format: :json }
        resources :incomes, only: %i[index show create update destroy], defaults: { format: :json }
        resources :fixed_recurring_entries, defaults: { format: :json }
        resources :fixed_recurring_occurrences,
                  only: %i[index],
                  controller: :fixed_recurring_entry_occurrences,
                  defaults: { format: :json } do
          member do
            post :apply
            post :cancel
          end
        end
        resources :budgets, defaults: { format: :json } do
          get :current, on: :collection
        end
        resource :dashboard, only: [], controller: :dashboard, defaults: { format: :json } do
          get :stats
        end
      end

      resources :invitations, only: [], defaults: { format: :json } do
        member do
          post :accept
        end
      end
    end
  end
end
