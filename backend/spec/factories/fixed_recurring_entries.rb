FactoryBot.define do
  factory :fixed_recurring_entry do
    association :account
    category { association :category, :expense, account: account }
    title { "固定支出" }
    kind { :expense }
    amount { 10_000 }
    day_of_month { 5 }
    use_end_of_month { false }
    effective_from { Date.new(2025, 1, 1) }
    effective_to { Date.new(2025, 12, 1) }
    memo { "メモ" }

    trait :income do
      kind { :income }
      category { association :category, :income, account: account }
    end
  end
end
