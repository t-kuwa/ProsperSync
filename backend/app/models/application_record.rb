# ==============================================
# 全てのモデルの基底クラス
# ==============================================
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end
