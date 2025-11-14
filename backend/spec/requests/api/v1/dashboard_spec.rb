require "rails_helper"

RSpec.describe "API::V1::Dashboard", type: :request do
  include ActiveSupport::Testing::TimeHelpers
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:other_user) { create(:user) }

  before do
    travel_to Date.new(2025, 2, 15)
  end

  after { travel_back }

  describe "GET /api/v1/accounts/:account_id/dashboard/stats" do
    before do
      # current month
      create(:income, account:, user:, amount: 300_000, received_on: Date.new(2025, 2, 5))
      create(:expense, account:, user:, amount: 120_000, spent_on: Date.new(2025, 2, 10))

      # previous month
      create(:income, account:, user:, amount: 200_000, received_on: Date.new(2025, 1, 15))
      create(:expense, account:, user:, amount: 80_000, spent_on: Date.new(2025, 1, 20))

      # historic data for breakdown
      create(:income, account:, user:, amount: 100_000, received_on: Date.new(2024, 11, 1))
    end

    it "アカウントメンバー向けにダッシュボード統計が返ること" do
      get "/api/v1/accounts/#{account.id}/dashboard/stats", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)

      body = parsed_body
      expect(body.dig("current_month", "income")).to eq(300_000)
      expect(body.dig("current_month", "expense")).to eq(120_000)
      expect(body.dig("previous_month", "income")).to eq(200_000)

      expect(body["monthly_breakdown"]).to be_an(Array)
      expect(body["monthly_breakdown"].size).to eq(6)
      expect(body["recent_transactions"]).to be_an(Array)
      expect(body["calendar_entries"]).to all(include("date", "income", "expense"))
      expect(body["balance"]).to include("total_income", "net")
    end

    it "アカウント外ユーザーは拒否されること" do
      get "/api/v1/accounts/#{account.id}/dashboard/stats", headers: auth_headers(other_user)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
