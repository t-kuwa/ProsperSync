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
    end
  end
end
