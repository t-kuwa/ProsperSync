FactoryBot.define do
  factory :membership do
    association :account
    association :user
    role { :member }
    invited_by { nil }

    trait :owner do
      role { :owner }
    end
  end
end
