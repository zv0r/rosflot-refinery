module Refinery
  Page.class_eval do
    acts_as_indexed :fields => [:ascii_title, :ascii_meta_keywords, :ascii_meta_description,
      :ascii_menu_title, :ascii_browser_title, :ascii_all_page_part_content]

    private
    def ascii_title
      self.title.to_ascii if self.title
    end

    def ascii_meta_keywords
      self.meta_keywords.to_ascii if self.meta_keywords
    end

    def ascii_meta_description
      self.meta_description.to_ascii if self.meta_description
    end

    def ascii_menu_title
      self.menu_title.to_ascii if self.menu_title
    end

    def ascii_browser_title
      self.browser_title.to_ascii if self.browser_title
    end

    def ascii_all_page_part_content
      self.all_page_part_content.to_ascii if self.all_page_part_content
    end

  end
end