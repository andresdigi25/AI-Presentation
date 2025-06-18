<script>
  let searchText = "";
  let isSearching = false;
  let showResults = false;
  let textResult = "";

  async function handleSearch() {
    textResult = "";
    showResults = false;
    
    try {
      isSearching = true;
      const res = await fetch("http://localhost:5678/webhook-test/doc-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchText }),
      });
      const result = await res.json();
      textResult = result.output;
      showResults = true;
    } catch (e) {
      console.error(e);
      textResult = "Error: Could not connect to the API";
      showResults = true;
    } finally {
      isSearching = false;
    }
  }

  function handleKeyUp(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }
</script>

<main>
  <div class="container">
    <h1 class="title">Qa Platform IA Docs</h1>
    
    <input
      bind:value={searchText}
      type="text"
      class="search-input"
      placeholder="Search Info | Topic | Course"
      on:keyup={handleKeyUp}
    />

    <div class="button-group">
      <button
        class="primary-button"
        on:click={handleSearch}
        disabled={isSearching}
      >
        <img src="/vercel.svg" alt="Vercel logomark" class="button-icon" />
        Chat with your documents
      </button>
      
      <a
        class="secondary-button"
        href="https://xwyiatry5y.us-east-1.awsapprunner.com/guides/explanation/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read our docs
      </a>
    </div>

    <div class="results">
      {#if isSearching}
        <div class="loading">
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
        </div>
      {:else if showResults}
        <textarea
          class="result-textarea"
          readonly
          value={textResult}
          placeholder="Results will appear here..."
        ></textarea>
      {/if}
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #ffffff;
    color: #171717;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #0a0a0a;
      color: #ededed;
    }
  }

  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 800px;
    width: 100%;
  }

  .title {
    font-size: 3rem;
    margin: 0;
    animation: bounce 1s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-10px);
    }
  }

  .search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    font-size: 1rem;
    animation: ping 1s ease-in-out infinite alternate;
  }

  @keyframes ping {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.02);
    }
  }

  .search-input:focus {
    outline: none;
    border-color: #007bff;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }

  @media (min-width: 640px) {
    .button-group {
      flex-direction: row;
    }
  }

  .primary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: #171717;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .primary-button:hover {
    background: #383838;
  }

  .primary-button:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }

  .secondary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    background: transparent;
    color: inherit;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 9999px;
    font-weight: 500;
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .secondary-button:hover {
    background: #f2f2f2;
  }

  @media (prefers-color-scheme: dark) {
    .secondary-button {
      border-color: rgba(255, 255, 255, 0.145);
    }
    
    .secondary-button:hover {
      background: #1a1a1a;
    }
  }

  .button-icon {
    width: 20px;
    height: 20px;
  }

  @media (prefers-color-scheme: dark) {
    .button-icon {
      filter: invert(1);
    }
  }

  .results {
    width: 100%;
    max-width: 500px;
  }

  .loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .loading-bar {
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 9999px;
    margin-bottom: 0.5rem;
  }

  .loading-bar:nth-child(1) {
    width: 12rem;
  }

  .loading-bar:nth-child(2) {
    width: 22.5rem;
  }

  .loading-bar:nth-child(3) {
    width: 100%;
  }

  .loading-bar:nth-child(4) {
    width: 20.625rem;
  }

  .loading-bar:nth-child(5) {
    width: 18.75rem;
  }

  .loading-bar:nth-child(6) {
    width: 22.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .loading-bar {
      background: #374151;
    }
  }

  .result-textarea {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
    background: #f9f9f9;
    color: #333;
  }

  @media (prefers-color-scheme: dark) {
    .result-textarea {
      background: #1a1a1a;
      color: #ededed;
      border-color: #444;
    }
  }

  .result-textarea:focus {
    outline: none;
    border-color: #007bff;
  }
</style>
