require "rails_helper"

RSpec.describe "API::V1::Invoices", type: :request do
  let(:issuer_account) { create(:account) }
  let(:payer_account) { create(:account) }
  let(:user) { create(:user) }
  let!(:issuer_membership) { create(:membership, :owner, account: issuer_account, user:) }

  describe "GET /api/v1/accounts/:account_id/invoices" do
    let!(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :issued) }

    it "発行者または支払者に関連する請求書一覧を返すこと" do
      get "/api/v1/accounts/#{issuer_account.id}/invoices", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(parsed_body.first).to include("id" => invoice.id, "status" => "issued")
    end
  end

  describe "POST /api/v1/accounts/:account_id/invoices" do
    let(:payload) do
      {
        invoice: {
          payer_account_id: payer_account.id,
          title: "家計精算",
          description: "食費と電気代折半",
          currency: "JPY",
          lines: [
            { description: "食費", quantity: 1, unit_price_minor: 5000 },
            { description: "電気代", quantity: 1, unit_price_minor: 7000 }
          ]
        }
      }
    end

    it "下書き請求書を作成し明細も登録されること" do
      expect do
        post "/api/v1/accounts/#{issuer_account.id}/invoices", params: payload, headers: auth_headers(user), as: :json
      end.to change { Invoice.count }.by(1)
         .and change { InvoiceLine.count }.by(2)

      expect(response).to have_http_status(:created)
      expect(parsed_body["status"]).to eq("draft")
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/invoices/:id/issue" do
    let!(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :draft) }

    it "請求書を発行できること" do
      patch "/api/v1/accounts/#{issuer_account.id}/invoices/#{invoice.id}/issue", headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body["status"]).to eq("issued")
    end
  end

  describe "POST /api/v1/accounts/:account_id/invoices/:id/cancel_requests" do
    let!(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :issued) }

    it "キャンセル申請を作成し請求書がcancel_pendingになること" do
      post "/api/v1/accounts/#{issuer_account.id}/invoices/#{invoice.id}/cancel_requests",
           params: { cancel_request: { reason: "誤請求" } },
           headers: auth_headers(user),
           as: :json

      expect(response).to have_http_status(:created)
      invoice.reload
      expect(invoice.status).to eq("cancel_pending")
      expect(parsed_body["status"]).to eq("pending")
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/invoices/:id/cancel_requests/:cancel_request_id/approve" do
    let!(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :cancel_pending) }
    let!(:cancel_request) { create(:invoice_cancel_request, invoice:) }

    it "キャンセル申請を承認して請求書がcanceledになること" do
      patch "/api/v1/accounts/#{issuer_account.id}/invoices/#{invoice.id}/cancel_requests/#{cancel_request.id}/approve",
            headers: auth_headers(user),
            as: :json

      expect(response).to have_http_status(:ok)
      invoice.reload
      cancel_request.reload
      expect(invoice.status).to eq("canceled")
      expect(cancel_request.status).to eq("approved")
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/invoices/:id/cancel_requests/:cancel_request_id/reject" do
    let!(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :cancel_pending) }
    let!(:cancel_request) { create(:invoice_cancel_request, invoice:) }

    it "キャンセル申請を却下して請求書がissuedに戻ること" do
      patch "/api/v1/accounts/#{issuer_account.id}/invoices/#{invoice.id}/cancel_requests/#{cancel_request.id}/reject",
            headers: auth_headers(user),
            as: :json

      expect(response).to have_http_status(:ok)
      invoice.reload
      cancel_request.reload
      expect(invoice.status).to eq("issued")
      expect(cancel_request.status).to eq("rejected")
    end
  end
end
