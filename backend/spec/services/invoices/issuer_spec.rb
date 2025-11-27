require "rails_helper"

RSpec.describe Invoices::Issuer do
  let(:issuer_account) { create(:account) }
  let(:payer_account) { create(:account) }
  let(:invoice) { create(:invoice, issuer_account:, payer_account:, status: :draft, issue_date: nil) }

  it "下書きを発行状態にし、issue_dateを設定すること" do
    described_class.call(invoice:)
    invoice.reload

    expect(invoice).to be_issued
    expect(invoice.issue_date).to eq(Time.zone.today)
  end
end
