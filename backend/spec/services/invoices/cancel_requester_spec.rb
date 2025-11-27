require "rails_helper"

RSpec.describe Invoices::CancelRequester do
  let(:issuer_account) { create(:account) }
  let(:payer_account) { create(:account) }
  let(:user) { create(:user) }
  let(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :issued) }

  it "発行済みの請求書にキャンセル申請を作成し、ステータスをcancel_pendingにすること" do
    request = described_class.call(invoice:, requested_by: user, reason: "金額誤り")

    invoice.reload
    expect(invoice).to be_cancel_pending
    expect(request).to be_pending
    expect(request.reason).to eq("金額誤り")
  end
end
