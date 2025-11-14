FactoryBot.define do
  factory :budget do
    association :account
    association :category, factory: [:category, :expense]

    amount { 50_000 }
    period_type { :monthly }
    period_year { Time.zone.today.year }
    period_month { Time.zone.today.month }
    name { "月次予算" }
  end
end
