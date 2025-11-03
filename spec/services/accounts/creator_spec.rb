require "rails_helper"

RSpec.describe Accounts::Creator, type: :service do
  describe ".call" do
    let(:owner) do
      allow(Workspace::ProvisionPersonal).to receive(:call)
      create(:user)
    end

    before do
      allow(Workspace::ProvisionPersonal).to receive(:call).and_call_original
    end

    it "creates a team account with owner membership" do
      account = described_class.call(owner:, params: { name: "チームA" })

      expect(account).to be_persisted
      expect(account.team?).to be(true)
      expect(account.name).to eq("チームA")

      membership = account.memberships.find_by(user: owner)
      expect(membership).to be_present
      expect(membership).to be_owner
    end

    it "raises error when attempting to create personal account" do
      expect do
        described_class.call(owner:, params: { name: "個人", account_type: :personal })
      end.to raise_error(Accounts::Creator::PersonalAccountCreationError)
    end

    it "rolls back when validation fails" do
      expect do
        described_class.call(owner:, params: { name: nil })
      end.to raise_error(ActiveRecord::RecordInvalid)

      expect(Account.where(owner:).count).to eq(0)
      expect(Membership.where(user: owner).count).to eq(0)
    end
  end
end
