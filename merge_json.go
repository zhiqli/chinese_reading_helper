package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
)

type ListItem struct {
	Src          string `json:"src"`
	Grade        string `json:"grade"`
	Semester     string `json:"semester"`
	LessonNumber string `json:"lesson_number"`
	Title        string `json:"title"`
	Emoji        string `json:"emoji,omitempty"`
	Author       string `json:"author,omitempty"`
	Reader       string `json:"reader,omitempty"`
	Content      string `json:"content,omitempty"`
}

type ArticleData struct {
	LessonNumber string `json:"lesson_number"`
	Title        string `json:"title"`
	Author       string `json:"author"`
	Reader       string `json:"reader"`
	Content      string `json:"content"`
	AudioURL     string `json:"audio_url"`
	DetailURL    string `json:"detail_url"`
	Grade        string `json:"grade"`
	Semester     string `json:"semester"`
	Emoji        string `json:"emoji"`
}

func main() {
	// Read list.json
	listData, err := ioutil.ReadFile("list.json")
	if err != nil {
		log.Fatal("Error reading list.json:", err)
	}

	var listItems []ListItem
	err = json.Unmarshal(listData, &listItems)
	if err != nil {
		log.Fatal("Error unmarshaling list.json:", err)
	}

	// Read all_articles_data.json
	articlesData, err := ioutil.ReadFile("all_articles_data.json")
	if err != nil {
		log.Fatal("Error reading all_articles_data.json:", err)
	}

	var articles []ArticleData
	err = json.Unmarshal(articlesData, &articles)
	if err != nil {
		log.Fatal("Error unmarshaling all_articles_data.json:", err)
	}

	// Create a map for quick lookup by title
	articleMap := make(map[string]ArticleData)
	for _, article := range articles {
		articleMap[article.Title] = article
	}

	// Merge data
	var mergedItems []ListItem
	for _, item := range listItems {
		var matchedArticle ArticleData
		var found bool

		// First try exact match
		if article, exists := articleMap[item.Title]; exists {
			matchedArticle = article
			found = true
		} else {
			// Try partial match - check if list title contains article title
			for _, article := range articles {
				if contains(item.Title, article.Title) && article.Title != "" {
					matchedArticle = article
					found = true
					break
				}
			}
		}

		if found {
			mergedItem := ListItem{
				Src:          item.Src,
				Grade:        item.Grade,
				Semester:     item.Semester,
				LessonNumber: item.LessonNumber,
				Title:        item.Title,
				Emoji:        matchedArticle.Emoji,
				Author:       matchedArticle.Author,
				Reader:       matchedArticle.Reader,
				Content:      matchedArticle.Content,
			}
			mergedItems = append(mergedItems, mergedItem)
		} else {
			// Keep the original item if no match found
			mergedItems = append(mergedItems, item)
		}
	}

	// Convert back to JSON
	outputJSON, err := json.MarshalIndent(mergedItems, "", "  ")
	if err != nil {
		log.Fatal("Error marshaling merged data:", err)
	}

	// Write to file
	err = ioutil.WriteFile("merged_list.json", outputJSON, 0644)
	if err != nil {
		log.Fatal("Error writing merged_list.json:", err)
	}

	fmt.Println("Successfully merged data into merged_list.json")
	fmt.Printf("Processed %d items from list.json\n", len(listItems))
	fmt.Printf("Found %d items in all_articles_data.json\n", len(articles))
	fmt.Printf("Created %d merged items\n", len(mergedItems))
}

// contains checks if string a contains string b
func contains(a, b string) bool {
	if len(b) == 0 {
		return false
	}
	for i := 0; i <= len(a)-len(b); i++ {
		if a[i:i+len(b)] == b {
			return true
		}
	}
	return false
}