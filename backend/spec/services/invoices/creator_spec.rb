require "rails_helper"

RSpec.describe Invoices::Creator do
  let(:issuer_account) { create(:account) }
  let(:payer_account) { create(:account) }

  it "請求書を下書きで作成し、金額を明細合計で計算すること" do
    invoice = described_class.call(
      issuer_account:,
      params: {
        payer_account_id: payer_account.id,
        title: "家計折半",
        description: "食費と電気代",
        currency: "JPY",
        lines: [
          { description: "食費折半", quantity: 1, unit_price_minor: 5000 },
          { description: "電気代折半", quantity: 1, unit_price_minor: 7000 },
        ],
      },
    )

    expect(invoice).to be_persisted
    expect(invoice).to be_draft
    expect(invoice.amount_minor).to eq(12_000)
    expect(invoice.invoice_number).to be_present
    expect(invoice.invoice_lines.count).to eq(2)
  end
end
