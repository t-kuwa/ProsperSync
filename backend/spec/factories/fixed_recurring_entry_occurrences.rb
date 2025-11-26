FactoryBot.define do
  factory :fixed_recurring_entry_occurrence do
    association :fixed_recurring_entry
    period_month { Date.new(2025, 1, 1) }
    occurs_on { period_month + 4 }
    status { :scheduled }
  end
end
