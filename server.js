const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());

// 정적 파일 서빙
app.use(express.static('.'));

// JSON 파일 API (인증 제거)
app.get('/api/day/:dayNumber', (req, res) => {
    const dayNumber = req.params.dayNumber;
    const jsonPath = path.join(__dirname, 'json', `day${dayNumber}.json`);
    
    console.log(`요청: Day ${dayNumber} 데이터`);
    console.log(`파일 경로: ${jsonPath}`);
    
    if (!fs.existsSync(jsonPath)) {
        console.log(`파일 없음: day${dayNumber}.json`);
        return res.status(404).json({ 
            error: `day${dayNumber}.json 파일을 찾을 수 없습니다.` 
        });
    }
    
    try {
        const data = fs.readFileSync(jsonPath, 'utf8');
        const words = JSON.parse(data);
        
        console.log(`Day ${dayNumber} 로드 성공: ${words.length}개 단어`);
        res.json(words);
        
    } catch (error) {
        console.error(`JSON 파싱 오류:`, error);
        res.status(500).json({ 
            error: 'JSON 파일을 읽는 중 오류가 발생했습니다.' 
        });
    }
});

// 사용 가능한 Day 목록 API (인증 제거)
app.get('/api/days', (req, res) => {
    const jsonDir = path.join(__dirname, 'json');
    
    try {
        const files = fs.readdirSync(jsonDir);
        const dayFiles = files.filter(file => file.match(/^day\d+\.json$/));
        const availableDays = dayFiles.map(file => {
            const dayNumber = file.match(/day(\d+)\.json/)[1];
            return parseInt(dayNumber);
        }).sort((a, b) => a - b);
        
        res.json(availableDays);
        
    } catch (error) {
        console.error('Day 목록 로드 오류:', error);
        res.status(500).json({ error: 'Day 목록을 불러올 수 없습니다.' });
    }
});

// 루트 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 KorVoca 서버가 실행되었습니다!`);
    console.log(`📱 웹 앱 주소: http://localhost:${PORT}`);
    console.log(`📊 API 엔드포인트: http://localhost:${PORT}/api/day/1`);
    console.log(`📁 JSON 파일 위치: ${path.join(__dirname, 'json')}`);
    
    // 사용 가능한 JSON 파일 확인
    const jsonDir = path.join(__dirname, 'json');
    if (fs.existsSync(jsonDir)) {
        const files = fs.readdirSync(jsonDir);
        const dayFiles = files.filter(file => file.match(/^day\d+\.json$/));
        console.log(`📚 사용 가능한 Day 파일: ${dayFiles.length}개`);
        console.log(`   ${dayFiles.join(', ')}`);
    } else {
        console.log('⚠️  json 폴더가 없습니다. 폴더를 생성하고 day1.json~day20.json 파일을 넣어주세요.');
    }
});