FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "ユーザー#{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { password }
  end
end
