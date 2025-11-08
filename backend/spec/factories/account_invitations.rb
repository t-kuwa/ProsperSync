require "securerandom"

FactoryBot.define do
  factory :account_invitation do
    association :account
    association :inviter, factory: :user
    sequence(:email) { |n| "invitee#{n}-#{SecureRandom.hex(4)}@example.com" }
    role { :member }
    token { SecureRandom.hex(10) }
    expires_at { 3.days.from_now }
  end
end
