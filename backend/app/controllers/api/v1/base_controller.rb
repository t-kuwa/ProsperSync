module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      protected

      def serialize_category(category)
        return unless category

        {
          id: category.id,
          account_id: category.account_id,
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          position: category.position,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      end

      def serialize_user(user)
        return unless user

        {
          id: user.id,
          name: user.name,
          email: user.email
        }
      end

      def serialize_fixed_recurring_entry(entry)
        return unless entry

        {
          id: entry.id,
          account_id: entry.account_id,
          category_id: entry.category_id,
          title: entry.title,
          kind: entry.kind,
          amount: entry.amount,
          day_of_month: entry.day_of_month,
          use_end_of_month: entry.use_end_of_month,
          effective_from: entry.effective_from,
          effective_to: entry.effective_to,
          memo: entry.memo,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          category: serialize_category(entry.category)
        }
      end
    end
  end
end
