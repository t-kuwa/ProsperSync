require "rails_helper"

RSpec.describe "API::V1::FixedRecurringEntries", type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:category) { create(:category, :expense, account:) }

  describe "GET /api/v1/accounts/:account_id/fixed_recurring_entries" do
    let!(:entry) do
      create(
        :fixed_recurring_entry,
        account:,
        category:,
        title: "家賃",
        kind: :expense,
        effective_from: Date.new(2025, 1, 1),
        effective_to: Date.new(2025, 3, 1),
      )
    end

    it "固定収支のテンプレート一覧を返すこと" do
      get "/api/v1/accounts/#{account.id}/fixed_recurring_entries", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.first).to include(
        "id" => entry.id,
        "title" => "家賃",
        "kind" => "expense",
        "category" => include("id" => category.id),
      )
    end
  end

  describe "POST /api/v1/accounts/:account_id/fixed_recurring_entries" do
    let(:payload) do
      {
        fixed_recurring_entry: {
          title: "家賃",
          kind: "expense",
          amount: 80_000,
          day_of_month: 31,
          use_end_of_month: true,
          effective_from: "2025-01-01",
          effective_to: "2025-03-01",
          category_id: category.id,
          memo: "2階",
        },
      }
    end

    it "テンプレートと対象期間の発生を作成すること" do
      expect do
        post "/api/v1/accounts/#{account.id}/fixed_recurring_entries", params: payload, headers: auth_headers(user), as: :json
      end.to change { account.fixed_recurring_entries.count }.by(1)
        .and change { FixedRecurringEntryOccurrence.count }.by(3)

      expect(response).to have_http_status(:created)
      expect(parsed_body).to include("title" => "家賃", "kind" => "expense", "day_of_month" => 31)
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/fixed_recurring_entries/:id" do
    let!(:entry) do
      create(
        :fixed_recurring_entry,
        account:,
        category:,
        title: "家賃",
        effective_from: Date.new(2025, 1, 1),
        effective_to: Date.new(2025, 3, 1),
      )
    end

    before do
      FixedRecurringEntries::Synchronizer.call(entry:)
    end

    it "期間を短縮すると対象外の発生が削除されること" do
      patch "/api/v1/accounts/#{account.id}/fixed_recurring_entries/#{entry.id}",
            params: { fixed_recurring_entry: { effective_to: "2025-02-01" } },
            headers: auth_headers(user),
            as: :json

      expect(response).to have_http_status(:ok)
      months = entry.occurrences.order(:period_month).pluck(:period_month)
      expect(months).to eq([Date.new(2025, 1, 1), Date.new(2025, 2, 1)])
    end
  end

  describe "GET /api/v1/accounts/:account_id/fixed_recurring_occurrences" do
    let!(:entry) do
      create(
        :fixed_recurring_entry,
        account:,
        category:,
        title: "家賃",
        day_of_month: 25,
        effective_from: Date.new(2025, 1, 1),
        effective_to: Date.new(2025, 3, 1),
      )
    end

    before do
      FixedRecurringEntries::Synchronizer.call(entry:)
    end

    it "指定月の発生一覧を返すこと" do
      get "/api/v1/accounts/#{account.id}/fixed_recurring_occurrences",
          params: { month: "2025-02" },
          headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.first).to include(
        "period_month" => "2025-02-01",
        "occurs_on" => "2025-02-25",
        "fixed_recurring_entry" => include("id" => entry.id, "title" => "家賃"),
      )
    end

    it "monthパラメータが不正な場合は422を返すこと" do
      get "/api/v1/accounts/#{account.id}/fixed_recurring_occurrences",
          params: { month: "invalid" },
          headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
      expect(parsed_body["errors"]).to include("monthパラメータはYYYY-MM形式で指定してください。")
    end
  end
end
