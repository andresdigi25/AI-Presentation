package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/fatih/color"
	"github.com/schollz/progressbar/v3"
	"io/ioutil"
	"net/http"
	"golang.org/x/net/html"
	"os"
	"path/filepath"
	"strings"
	"net/url"
)

func fetch(url string) (*html.Node, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return html.Parse(resp.Body)
}

func printTitle(n *html.Node) {
	if n.Type == html.ElementNode && n.Data == "title" && n.FirstChild != nil {
		fmt.Println("Title:", n.FirstChild.Data)
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		printTitle(c)
	}
}

func extractLinks(n *html.Node, base string) []string {
	var links []string
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "a" {
			for _, attr := range n.Attr {
				if attr.Key == "href" {
					href := attr.Val
					if strings.HasPrefix(href, "/") {
						href = base + href
					}
					links = append(links, href)
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(n)
	return links
}

func findBody(n *html.Node) *html.Node {
	if n.Type == html.ElementNode && n.Data == "body" {
		return n
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if body := findBody(c); body != nil {
			return body
		}
	}
	return nil
}

func extractText(n *html.Node) string {
	if n.Type == html.CommentNode {
		return ""
	}
	if n.Type == html.TextNode {
		return strings.TrimSpace(n.Data)
	}
	if n.Type != html.ElementNode {
		return ""
	}
	switch n.Data {
	case "script", "style", "noscript", "head", "meta", "link", "svg", "iframe", "footer", "nav":
		return ""
	}
	var text string
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		childText := extractText(c)
		if childText != "" {
			text += childText + " "
		}
	}
	return strings.Join(strings.Fields(text), " ")
}

func saveLinksCSV(links []string, filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()
	writer := csv.NewWriter(file)
	defer writer.Flush()
	for _, link := range links {
		if err := writer.Write([]string{link}); err != nil {
			return err
		}
	}
	return nil
}

func saveTextJSON(text string, filename string) error {
	data := map[string]string{"text": text}
	jsonBytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(filename, jsonBytes, 0644)
}

func sanitizeFilename(url string) string {
	url = strings.ReplaceAll(url, "https://", "")
	url = strings.ReplaceAll(url, "http://", "")
	url = strings.ReplaceAll(url, "/", "_")
	url = strings.ReplaceAll(url, "?", "_")
	url = strings.ReplaceAll(url, "&", "_")
	url = strings.ReplaceAll(url, "=", "_")
	url = strings.ReplaceAll(url, ":", "_")
	url = strings.ReplaceAll(url, "#", "_")
	if len(url) > 64 {
		url = url[:64]
	}
	return url
}

func getDomain(rawurl string) string {
	u, err := url.Parse(rawurl)
	if err != nil {
		return sanitizeFilename(rawurl)
	}
	host := u.Hostname()
	return sanitizeFilename(host)
}

func readURLsFromEnv() ([]string, error) {
	urlsEnv := os.Getenv("CRAWL_URLS")
	if urlsEnv == "" {
		return nil, fmt.Errorf("CRAWL_URLS environment variable not set")
	}
	parts := strings.Split(urlsEnv, ",")
	var urls []string
	for _, part := range parts {
		url := strings.TrimSpace(part)
		if url != "" {
			urls = append(urls, url)
		}
	}
	return urls, nil
}

func printProgress(current, total int, url string) {
	percent := float64(current) / float64(total) * 100
	barLen := 40
	filledLen := int(float64(barLen) * float64(current) / float64(total))
	bar := strings.Repeat("=", filledLen) + strings.Repeat("-", barLen-filledLen)
	fmt.Printf("\r[%s] %3.0f%% (%d/%d) %s", bar, percent, current, total, url)
	if current == total {
		fmt.Println()
	}
}

func prettyPrintLinks(links []string) {
	if len(links) == 0 {
		color.Yellow("No links found.")
		return
	}
	show := len(links) / 10
	if show == 0 {
		show = 1
	}
	color.Cyan("Showing %d of %d links:", show, len(links))
	for i := 0; i < show; i++ {
		color.Green("%2d. %s", i+1, links[i])
	}
	if show < len(links) {
		color.Yellow("...and %d more not shown", len(links)-show)
	}
}

func main() {
	outputDir := "output/go"
	cwd, _ := os.Getwd()
	urls, err := readURLsFromEnv()
	if err != nil {
		color.Red("Error reading CRAWL_URLS: %v", err)
		return
	}
	total := len(urls)
	bar := progressbar.NewOptions(total,
		progressbar.OptionSetDescription("Crawling URLs"),
		progressbar.OptionShowCount(),
		progressbar.OptionSetWidth(40),
		progressbar.OptionSetTheme(progressbar.Theme{Saucer: "=", SaucerHead: ">", SaucerPadding: "-", BarStart: "[", BarEnd: "]"}),
	)
	for _, url := range urls {
		bar.Describe(fmt.Sprintf("Crawling: %s", url))
		folderName := getDomain(url)
		absOutputDir := filepath.Join(cwd, outputDir, folderName)
		if err := os.MkdirAll(absOutputDir, 0755); err != nil {
			color.Red("Error creating output directory: %v", err)
			bar.Add(1)
			continue
		}
		doc, err := fetch(url)
		if err != nil {
			color.Red("Error fetching URL: %s %v", url, err)
			bar.Add(1)
			continue
		}
		color.Blue("\n--- %s ---", url)
		printTitle(doc)
		links := extractLinks(doc, url)
		prettyPrintLinks(links)
		linksPath := filepath.Join(absOutputDir, "links.csv")
		if err := saveLinksCSV(links, linksPath); err != nil {
			color.Red("Error saving links.csv for %s: %v", url, err)
		}
		body := findBody(doc)
		var text string
		if body != nil {
			text = extractText(body)
		} else {
			text = ""
		}
		textPath := filepath.Join(absOutputDir, "text.json")
		if err := saveTextJSON(text, textPath); err != nil {
			color.Red("Error saving text.json for %s: %v", url, err)
		}
		bar.Add(1)
	}
	color.Green("\nDone! Results saved in %s", outputDir)
}
