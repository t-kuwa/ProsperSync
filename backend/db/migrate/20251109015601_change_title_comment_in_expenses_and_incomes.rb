class ChangeTitleCommentInExpensesAndIncomes < ActiveRecord::Migration[8.0]
  def change
    change_column_comment :expenses, :title, "支出の内容"
    change_column_comment :incomes, :title, "収入の内容"
  end
end
