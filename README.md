# Kiwi Free IPTV - Stremio Addon

A Stremio addon that provides free-to-air New Zealand TV channels with rich Electronic Program Guide (EPG) data.

## Features

-   **Live TV Channels**: Access to major NZ channels including TVNZ, Three, Prime, and more.
-   **Rich EPG Data**: Displays detailed information for the currently playing program:
    -   **Program Title & Description**
    -   **Visuals**: Program posters and background images.
    -   **Runtime**: Accurate duration of the show.
    -   **Release Year**: Original air date/year.
    -   **Genres & Categories**: Detailed categorization.
    -   **Age Ratings**: Displays age restrictions (e.g., `G`, `PG`, `M`) as genres.
    -   **IMDb Ratings**: Shows IMDb star ratings (e.g., `IMDb: 7.5/10`) as genres.
-   **Smart Stream Resolution**: Automatically handles redirects and stream URLs to ensure playback compatibility (especially for Stremio Web).

## Installation & Usage

### Prerequisites
-   Node.js (v14 or higher)
-   npm

### Running Locally

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd iptv-nz-addon
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the server:
    ```bash
    npm start
    ```

4.  The addon will be available at `http://127.0.0.1:7000/manifest.json`. You can load this URL into Stremio.

### Deployment

This addon is ready to be deployed on platforms like Vercel, Heroku, or any Node.js hosting service.

## Credits

-   **Matt Huisman**: Huge thanks to [Matt Huisman](https://www.matthuisman.nz/) for providing the raw IPTV playlists and EPG data. This addon would not be possible without his work.
