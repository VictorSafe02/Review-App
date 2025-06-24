


CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,
    activity_status BOOLEAN DEFAULT TRUE,
    allow_followers BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    description TEXT,
    cover_image_url VARCHAR(255),
    publication_year INT,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies_tv (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    item_type ENUM('Movie', 'TV Show') NOT NULL,
    director VARCHAR(255),
    genre VARCHAR(100),
    description TEXT,
    poster_url VARCHAR(255),
    release_year INT,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    item_type ENUM('Book', 'MovieTV') NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    pros TEXT,
    cons TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX (user_id),
    INDEX (item_id, item_type)
);

CREATE TABLE IF NOT EXISTS followers (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    item_type ENUM('Book', 'MovieTV') NOT NULL,
    favorite_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id, item_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    
);


IINSERT INTO books (title, author, genre, description, cover_image_url, publication_year, average_rating) VALUES
('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 'An epic tale of hobbits, elves, dwarves, and men in Middle-earth.', 'https://upload.wikimedia.org/wikipedia/en/4/48/Lord_Rings_Return_King.jpg', 1954, 0),
('Pride and Prejudice', 'Jane Austen', 'Romance', 'A classic story of love and society in 19th-century England.', 'https://ppld.org/sites/default/files/styles/large/public/images/bookjackets/pride_0.jpg?itok=GJ7_g99r', 1813, 0),
('1984', 'George Orwell', 'Dystopian', 'A chilling vision of a totalitarian future.', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg', 1949, 0),
('To Kill a Mockingbird', 'Harper Lee', 'Southern Gothic', 'A powerful story of justice and racism in the American South.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/500px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg', 1960, 0),
('Dune', 'Frank Herbert', 'Science Fiction', 'A complex and influential science fiction epic.', 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458._SY180_.jpg', 1965, 0),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'An adventure story about a hobbit who goes on a quest.', 'https://m.media-amazon.com/images/I/814k9atbkQL._SL1500_.jpg', 1937, 0),
('Emma', 'Jane Austen', 'Romance', 'A comedy of manners about a well-meaning but misguided matchmaker.', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1373627931i/6969.jpg', 1815, 0),
('Brave New World', 'Aldous Huxley', 'Dystopian', 'A satirical and disturbing look at a technologically advanced society.', 'https://m.media-amazon.com/images/I/91D4YvdC0dL._SL1500_.jpg', 1932, 0),
('The Catcher in the Rye', 'J.D. Salinger', 'Coming-of-age', 'A story of adolescent alienation and rebellion.', 'https://cdn.britannica.com/94/181394-050-2F76F7EE/Reproduction-cover-edition-The-Catcher-in-the.jpg?w=300', 1951, 0),
('Foundation', 'Isaac Asimov', 'Science Fiction', 'The first book in the groundbreaking Foundation series.', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1417900846i/29579.jpg', 1951, 0);


INSERT INTO movies_tv (title, item_type, director, genre, description, poster_url, release_year, average_rating) VALUES
('The Shawshank Redemption', 'Movie', 'Frank Darabont', 'Drama', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSf1DK32xKMQzqSl8wnY1BLVu_gdwsRYzVSNM6A03r6c-fEwrif8raKzkFRuerw1KHdDICvOw', 1994, 0),
('Pulp Fiction', 'Movie', 'Quentin Tarantino', 'Crime', 'The lives of several characters intertwine in a tale of crime and redemption.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj6_ot-pRVfLMtc2vyguVf_0m0HUuvdBw2I-EuFXkUIEB_eoAS', 1994, 0),
('The Godfather', 'Movie', 'Francis Ford Coppola', 'Crime', 'The Corleone family saga, a tale of power, tradition, and violence.', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTWmKJlXjXTiE9hkekFBy9WCRMf0eKZx2mrsgenlO-qzr9H7v0A', 1972, 0),
('The Dark Knight', 'Movie', 'Christopher Nolan', 'Action', 'Batman faces his greatest foe, the Joker.', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQkUywIUXDjHSQJIaNHYVs08osgBpF5Ot-xmB_omyEZeeRP9Xug', 2008, 0),
('12 Angry Men', 'Movie', 'Sidney Lumet', 'Drama', 'A jury deliberates the fate of a young man accused of murder.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLu6fLtsTwfKrQhpWzr9YtjqsdjIufAFRzswHTqkANXYkLFOtu', 1957, 0),
('Westworld', 'TV Show', 'Jonathan Nolan, Lisa Joy', 'Sci-Fi', 'In a futuristic Western theme park populated by artificial beings, visitors can live out their fantasies, but the androids begin to question their reality.', 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcStWjowZB0X0SitfAlOr3xHjNkckKb0EXk0EVFxQUmI6ImwTWfx', 2016, 0),
('The Good Place', 'TV Show', 'Michael Schur', 'Comedy', 'Four humans and their otherworldly guide struggle to define what it means to be good.', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ6IUIXhnNRmKsnbCv7DIM_az8nMzScUOqpNlCV5HBp6IMYvOA_', 2016, 0),
('Succession', 'TV Show', 'Jesse Armstrong', 'Drama', 'The Roy family is known globally for media and entertainment; however, their world changes when their father, Logan Roy, experiences a decline in health.', 'https://goldendiscs.ie/cdn/shop/files/SUCCESSION_CSR_2D_front_540x@2x.jpg?v=1691051540', 2018, 0),
('Band of Brothers', 'TV Show', 'Tom Hanks, Steven Spielberg', 'War', 'The story of Easy Company of the 101st Airborne Division from their training in Camp Toccoa, Georgia, through their participation in the major battles of World War II.', 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQC4TA1JRXuBwBxzD13MK59WjPXcaYG5VW0kqWlKdLdbSrsoFa8', 2001, 0),
('The Queen''s Gambit', 'TV Show', 'Scott Frank, Allan Scott', 'Drama', 'Orphaned in the 1950s, a chess prodigy struggles with addiction while competing in tournaments.', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRRWmvhaeK4muPAAfjrYGGfNa5l334h_bWhasvxSbeGc-QHKkoc', 2020, 0);






SELECT DISTINCT genre FROM books;
SELECT DISTINCT genre FROM movies_tv;
SELECT COUNT(*) FROM books WHERE genre IS NULL;
SELECT COUNT(*) FROM movies_tv WHERE genre IS NULL;

ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;

ALTER TABLE users
 ADD COLUMN email_notifications TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
 ADD COLUMN follower_notifications TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
 ADD COLUMN like_notifications TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
 ADD COLUMN recommendation_notifications TINYINT(1) UNSIGNED NOT NULL DEFAULT 1;