FactoryBot.define do
  factory :budget do
    association :account
    category { create(:category, :expense, account: account) }

    amount { 50_000 }
    period_type { :monthly }
    period_year { Time.zone.today.year }
    period_month { Time.zone.today.month }
    name { "月次予算" }
    repeat_enabled { false }
    repeat_until_date { nil }
  end
end
