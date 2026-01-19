/**
 * L'AMOUR - Valentine's Event 2026
 * Countdown Timer + Music Manager + Real-time Red Flags with Supabase
 */

const SUPABASE_URL = 'https://jbhhvtboinunpuipjvkz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiaGh2dGJvaW51bnB1aXBqdmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4Mjg2OTYsImV4cCI6MjA4NDQwNDY5Nn0.VVkcHPqywN0n6weR3xXm7znoBe8hOU4DSNJ5BZvQ8po';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_REST_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
};

let supabase = null;

function initSupabase() {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase SDK loaded and client created');
        testSupabaseConnection();
        return true;
    }
    console.warn('⚠️ Supabase SDK not available');
    return false;
}

async function testSupabaseConnection() {
    if (!supabase) return;
    try {
        console.log('🔍 Testing Supabase connection...');
        const { data, error } = await supabase.from('red_flags').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase connection error:', error.message);
            return false;
        }
        console.log('✅ Supabase connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Supabase test failed:', error);
        return false;
    }
}

class CountdownTimer {
    constructor() {
        this.targetDate = new Date('2026-02-14T15:00:00').getTime();
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        
        this.init();
    }

    init() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        if (distance < 0) {
            this.elements.days.textContent = '00';
            this.elements.hours.textContent = '00';
            this.elements.minutes.textContent = '00';
            this.elements.seconds.textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.elements.days.textContent = String(days).padStart(2, '0');
        this.elements.hours.textContent = String(hours).padStart(2, '0');
        this.elements.minutes.textContent = String(minutes).padStart(2, '0');
        this.elements.seconds.textContent = String(seconds).padStart(2, '0');
    }
}

class ScrollIndicator {
    constructor() {
        this.button = document.querySelector('.scroll-indicator');
        if (this.button) {
            this.button.addEventListener('click', () => this.scrollDown());
        }
    }

    scrollDown() {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎉 L\'amour - Valentine\'s Event 2026 🎉', 'color: #FF5722; font-size: 20px; font-weight: bold;');
    
    new CountdownTimer();
    new ScrollIndicator();
});
