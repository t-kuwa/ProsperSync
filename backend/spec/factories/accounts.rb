FactoryBot.define do
  factory :account do
    association :owner, factory: :user
    sequence(:name) { |n| "チーム#{n}" }
    account_type { :team }
    sequence(:slug) { |n| "account-#{n}" }
    description { "チーム用ワークスペース" }

    trait :personal do
      account_type { :personal }
    end
  end
end
