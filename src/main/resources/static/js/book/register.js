// 검색 함수 (도서 검색 후 결과를 표시)
function searchBooks() {
    const query = document.getElementById('searchQuery').value;

    // 카카오 API, 국립중앙도서관 API 동시 호출
    fetch(`/api/v1/books/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = '';

            const bookRequests = data.map(book => {
                return fetch(`/api/v1/books/library-info?isbn=${book.isbn}`)
                    .then(response => response.json())
                    .then(libraryInfo => {
                        return {
                            ...book,
                            callNumber: libraryInfo.callNumber || '정보 없음',
                            topicId: libraryInfo.topicId || '정보 없음',
                        };
                    })
                    .catch(error => {
                        console.error('Error fetching library info:', error);
                        return {
                            ...book,
                            callNumber: '정보 없음',
                            topicId: '정보 없음',
                        };
                    });
            });

            // 모든 요청이 끝난 후 결과 표시
            Promise.all(bookRequests)
                .then(mergedBooks => {
                    mergedBooks.forEach(book => {
                        if (book.callNumber !== 'N/A') {
                            const card = document.createElement('div');
                            card.className = 'col';
                            card.innerHTML = `
                                <div class="card h-100 text-center p-2">
                                    <img src="${book.thumbnail || '/images/bookImage.jpg'}" class="card-img-top" alt="썸네일" style="max-height: 150px; object-fit: contain;">
                                    <div class="card-body">
                                        <h5 class="card-title">${book.title}</h5>
                                        <p class="card-text">${book.author} | ${book.publisher}</p>
                                        <p class="card-text">${book.callNumber} | ${book.topicId}</p>
                                        <button class="btn custom-btn-outline" onclick="selectBook('${book.title}', '${book.author}', '${book.publisher}', '${book.publishedDate}', '${book.isbn}', '${book.callNumber}', '${book.contents}', '${book.thumbnail}', '${book.topicId}')" data-bs-dismiss="modal">선택</button>
                                    </div>
                                </div>
                            `;
                            resultsContainer.appendChild(card);
                        }
                    });
                })
                .catch(error => console.error('Error with book requests:', error));
        })
        .catch(error => console.error('Error:', error));
}

// 도서 선택 함수 (선택한 도서 정보를 상세 정보에 표시)
function selectBook(title, author, publisher, publishedDate, isbn, callNumber, contents, thumbnail, topicId) {
    document.getElementById('bookTitle').textContent = title;
    document.getElementById('bookAuthor').textContent = author;
    document.getElementById('bookPublisher').textContent = publisher;
    document.getElementById('bookPublishedDate').textContent = publishedDate;
    document.getElementById('bookIsbn').textContent = isbn;
    document.getElementById('bookCallNumber').textContent = callNumber;
    document.getElementById('bookContents').textContent = contents;
    document.getElementById('bookThumbnail').src = thumbnail || '/images/bookImage.jpg';
    document.getElementById('bookTopicId').textContent = topicId;
}

// 도서 등록 함수
function registerBook() {
    const title = document.getElementById('bookTitle').textContent;
    const author = document.getElementById('bookAuthor').textContent;
    const publisher = document.getElementById('bookPublisher').textContent;
    const publishedDate = document.getElementById('bookPublishedDate').textContent;
    const isbn = document.getElementById('bookIsbn').textContent;
    const callNumber = document.getElementById('bookCallNumber').textContent;
    const topicId = document.getElementById('bookTopicId').textContent;
    const contents = document.getElementById('bookContents').textContent;
    const thumbnail = document.getElementById('bookThumbnail').src;

    fetch('/api/v1/books/register', {
        method: 'POST',
        body: JSON.stringify({ title, author, publisher, publishedDate, isbn, callNumber, topicId, contents, thumbnail }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
    })
        .then(response => response.text())
        .then(data => alert('도서 등록 성공!'))
        .catch(error => alert('도서 등록 실패'));
}
