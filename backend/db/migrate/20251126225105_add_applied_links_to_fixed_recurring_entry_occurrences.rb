class AddAppliedLinksToFixedRecurringEntryOccurrences < ActiveRecord::Migration[8.0]
  def change
    add_reference :fixed_recurring_entry_occurrences, :income, null: true, foreign_key: true
    add_reference :fixed_recurring_entry_occurrences, :expense, null: true, foreign_key: true
  end
end
