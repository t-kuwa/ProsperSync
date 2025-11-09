FactoryBot.define do
  factory :category do
    association :account
    sequence(:name) { |n| "カテゴリ#{n}" }
    type { :expense }
    position { 0 }

    trait :expense do
      type { :expense }
    end

    trait :income do
      type { :income }
    end

    trait :with_color do
      color { "#FF5733" }
    end

    trait :with_icon do
      icon { "food" }
    end
  end
end

