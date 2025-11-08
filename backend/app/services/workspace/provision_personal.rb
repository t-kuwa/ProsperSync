require "securerandom"

# ==============================================
# 個人用ワークスペースを作成するサービスクラス
# ==============================================
module Workspace
  class ProvisionPersonal
    def self.call(user:)
      new(user: user).call
    end

    def initialize(user:)
      @user = user
    end

    def call
      return existing_personal_account if existing_personal_account.present?

      ActiveRecord::Base.transaction do
        account = Account.create!(
          owner: user,
          name: default_name,
          account_type: :personal,
          slug: SecureRandom.uuid,
        )

        Membership.create!(
          account: account,
          user: user,
          role: :owner,
        )

        user.update!(primary_account: account)

        account
      end
    end

    private

    attr_reader :user

    def existing_personal_account
      user.primary_account || user.accounts.personal.first
    end

    def default_name
      "#{user.name}のワークスペース"
    end
  end
end
