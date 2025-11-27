require "rails_helper"

RSpec.describe Invoices::CancelResolver do
  let(:issuer_account) { create(:account) }
  let(:payer_account) { create(:account) }
  let(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :issued) }
  let(:user) { create(:user) }
  let(:cancel_request) { create(:invoice_cancel_request, invoice:, requested_by: user, status: :pending) }

  it "キャンセル申請を承認すると請求書がcanceledになること" do
    described_class.call(cancel_request:, resolver: user, approve: true)

    invoice.reload
    cancel_request.reload
    expect(invoice).to be_canceled
    expect(cancel_request).to be_approved
    expect(cancel_request.resolved_by).to eq(user)
    expect(cancel_request.resolved_at).to be_present
  end

  it "キャンセル申請を却下すると請求書はissuedに戻ること" do
    invoice.update!(status: :cancel_pending)

    described_class.call(cancel_request:, resolver: user, approve: false)

    invoice.reload
    cancel_request.reload
    expect(invoice).to be_issued
    expect(cancel_request).to be_rejected
  end
end
