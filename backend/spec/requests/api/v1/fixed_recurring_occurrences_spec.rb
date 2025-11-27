require "rails_helper"

RSpec.describe "API::V1::FixedRecurringEntryOccurrences", type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:category) { create(:category, :expense, account:) }
  let(:entry) do
    create(
      :fixed_recurring_entry,
      account:,
      category:,
      title: "家賃",
      day_of_month: 5,
      effective_from: Date.new(2025, 1, 1),
      effective_to: Date.new(2025, 1, 1),
    )
  end
  let!(:occurrence) do
    FixedRecurringEntries::Synchronizer.call(entry:)
    entry.occurrences.first
  end

  describe "POST /api/v1/accounts/:account_id/fixed_recurring_occurrences/:id/apply" do
    it "発生をappliedにしてExpenseを作成すること" do
      expect do
        post "/api/v1/accounts/#{account.id}/fixed_recurring_occurrences/#{occurrence.id}/apply",
             headers: auth_headers(user),
             as: :json
      end.to change { Expense.count }.by(1)

      expect(response).to have_http_status(:ok)
      occurrence.reload
      expect(occurrence).to be_applied
      expect(occurrence.expense).to be_present
    end
  end

  describe "POST /api/v1/accounts/:account_id/fixed_recurring_occurrences/:id/cancel" do
    before do
      post "/api/v1/accounts/#{account.id}/fixed_recurring_occurrences/#{occurrence.id}/apply",
           headers: auth_headers(user),
           as: :json
    end

    it "appliedな発生をキャンセルし、紐付くExpenseを削除すること" do
      expect do
        post "/api/v1/accounts/#{account.id}/fixed_recurring_occurrences/#{occurrence.id}/cancel",
             headers: auth_headers(user),
             as: :json
      end.to change { Expense.count }.by(-1)

      expect(response).to have_http_status(:ok)
      occurrence.reload
      expect(occurrence).to be_canceled
      expect(occurrence.expense).to be_nil
    end
  end
end
