require "rails_helper"

RSpec.describe "API::V1::Incomes", type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:other_user) { create(:user) }
  let!(:category) { create(:category, :income, account:) }

  describe "GET /api/v1/accounts/:account_id/incomes" do
    let!(:feb_income) do
      create(:income, account:, user:, category:, received_on: Date.new(2025, 2, 1), amount: 200_000)
    end
    let!(:jan_income) do
      create(:income, account:, user:, category:, received_on: Date.new(2025, 1, 10), amount: 150_000)
    end

    it "アカウントの収入がシリアライズされて返ること" do
      get "/api/v1/accounts/#{account.id}/incomes", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.first).to include(
        "id" => feb_income.id,
        "category" => include("id" => category.id),
        "user" => include("id" => user.id),
      )
    end

    it "日付範囲で絞り込めること" do
      get "/api/v1/accounts/#{account.id}/incomes",
          params: { start_date: "2025-02-01", end_date: "2025-02-28" },
          headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.map { |item| item["id"] }).to eq([feb_income.id])
    end

    it "日付指定が不正な場合エラーになること" do
      get "/api/v1/accounts/#{account.id}/incomes",
          params: { start_date: "invalid-date" },
          headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
      expect(parsed_body["errors"]).to include("日付はYYYY-MM-DD形式で指定してください。")
    end

    it "アカウント外ユーザーは拒否されること" do
      get "/api/v1/accounts/#{account.id}/incomes", headers: auth_headers(other_user)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts/:account_id/incomes" do
    let(:payload) do
      {
        income: {
          title: "ボーナス",
          amount: 300_000,
          received_on: "2025-03-31",
          memo: "Q1",
          category_id: category.id,
        },
      }
    end

    it "収入を作成できること" do
      expect do
        post "/api/v1/accounts/#{account.id}/incomes", params: payload, headers: auth_headers(user), as: :json
      end.to change { account.incomes.reload.count }.by(1)

      expect(response).to have_http_status(:created)
      expect(parsed_body).to include("title" => "ボーナス", "category_id" => category.id)
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/incomes/:id" do
    let!(:income) { create(:income, account:, user:, category:, title: "旧称") }

    it "収入を更新できること" do
      patch "/api/v1/accounts/#{account.id}/incomes/#{income.id}",
            params: { income: { title: "新称", memo: "updated" } },
            headers: auth_headers(user),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body).to include("title" => "新称", "memo" => "updated")
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/incomes/:id" do
    let!(:income) { create(:income, account:, user:, category:) }

    it "収入を削除できること" do
      expect do
        delete "/api/v1/accounts/#{account.id}/incomes/#{income.id}", headers: auth_headers(user), as: :json
      end.to change { account.incomes.reload.count }.by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
