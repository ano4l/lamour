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

class RedFlagsManager {
    constructor() {
        this.redFlags = [];
        this.subscription = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        
        if (!supabase) {
            console.warn('⚠️ Supabase SDK not available, using REST fallback');
            await this.loadRedFlagsViaRest();
            return;
        }
        
        try {
            console.log('📥 Loading red flags from Supabase...');
            await this.loadRedFlags();
            this.setupRealtimeListener();
            console.log('✅ Red flags loaded and real-time listener active');
        } catch (error) {
            console.error('❌ Error loading red flags from Supabase:', error);
            this.addInitialRedFlags();
        }
    }

    async loadRedFlags() {
        if (!supabase) {
            await this.loadRedFlagsViaRest();
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('red_flags')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('❌ Error loading red flags:', error.message);
                await this.loadRedFlagsViaRest();
                return;
            }

            if (data && data.length > 0) {
                console.log(`📊 Loaded ${data.length} red flags from Supabase`);
                data.forEach(flag => {
                    this.displayRedFlag(flag.text);
                });
                this.redFlags = data.map(f => f.text);
            } else {
                console.log('📭 No red flags in database, using initial flags');
                this.addInitialRedFlags();
            }
        } catch (error) {
            console.error('❌ Error in loadRedFlags:', error);
            await this.loadRedFlagsViaRest();
        }
    }

    async loadRedFlagsViaRest() {
        try {
            const response = await fetch(`${SUPABASE_REST_URL}/red_flags?select=*` + '&order=created_at.desc&limit=20', {
                headers: SUPABASE_REST_HEADERS
            });
            if (!response.ok) {
                throw new Error(`REST load failed: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                console.log(`📊 Loaded ${data.length} red flags via REST`);
                data.forEach(flag => this.displayRedFlag(flag.text));
                this.redFlags = data.map(f => f.text);
            } else {
                this.addInitialRedFlags();
            }
        } catch (error) {
            console.error('❌ REST fallback failed, using initial red flags:', error);
            this.addInitialRedFlags();
        }
    }

    setupRealtimeListener() {
        if (!supabase) return;
        
        try {
            this.subscription = supabase
                .channel('red_flags_channel')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'red_flags'
                    },
                    (payload) => {
                        console.log('New red flag received:', payload);
                        this.displayRedFlag(payload.new.text);
                        this.redFlags.unshift(payload.new.text);
                        
                        const list = document.getElementById('redflagsList');
                        while (list && list.children.length > 20) {
                            list.removeChild(list.lastChild);
                            this.redFlags.pop();
                        }
                    }
                )
                .subscribe();
        } catch (error) {
            console.error('Error setting up real-time listener:', error);
        }
    }

    addInitialRedFlags() {
        const initialFlags = [
            'Bad communication',
            'Ghosting without explanation',
            'Still friends with ex',
            'Love bombing',
            'No ambition or goals',
            'Terrible music taste'
        ];
        
        initialFlags.forEach(flag => this.displayRedFlag(flag));
    }

    setupEventListeners() {
        const form = document.getElementById('redflagForm');
        const input = document.getElementById('redflagInput');
        const charCount = document.getElementById('charCount');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (text) {
                    this.submitRedFlag(text);
                    input.value = '';
                    charCount.textContent = '0/150';
                }
            });
        } else {
            console.warn('Red flag form not found');
        }
        
        if (input) {
            input.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCount.textContent = `${length}/150`;
            });
        }
        
        const quickPickBtns = document.querySelectorAll('.quick-pick-btn');
        if (quickPickBtns.length > 0) {
            quickPickBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const text = btn.dataset.text;
                    if (text) {
                        this.submitRedFlag(text);
                    }
                });
            });
        } else {
            console.warn('No quick pick buttons found');
        }
    }

    async submitRedFlag(text) {
        console.log('📝 Submitting red flag:', text);
        
        if (!text || text.length === 0) {
            console.warn('⚠️ Empty red flag text');
            return;
        }
        
        this.displayRedFlag(text);
        this.redFlags.unshift(text);
        
        if (!supabase) {
            console.log('💾 Supabase SDK not available, using REST fallback');
            await this.submitRedFlagViaRest(text);
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('red_flags')
                .insert([{ text }]);

            if (error) {
                console.error('❌ Error submitting red flag to Supabase:', error.message);
                await this.submitRedFlagViaRest(text);
            } else {
                console.log('✅ Red flag saved to Supabase');
            }
        } catch (error) {
            console.error('❌ Error in submitRedFlag:', error);
            await this.submitRedFlagViaRest(text);
        }
    }

    async submitRedFlagViaRest(text) {
        try {
            const response = await fetch(`${SUPABASE_REST_URL}/red_flags`, {
                method: 'POST',
                headers: SUPABASE_REST_HEADERS,
                body: JSON.stringify({ text })
            });
            if (!response.ok) {
                throw new Error(`REST insert failed: ${response.status}`);
            }
            console.log('✅ Red flag saved via REST fallback');
        } catch (error) {
            console.error('❌ REST fallback insert failed:', error);
        }
    }

    displayRedFlag(text) {
        const list = document.getElementById('redflagsList');
        if (!list) {
            console.warn('⚠️ Red flags list element not found');
            return;
        }
        
        const item = document.createElement('div');
        item.className = 'redflag-item';
        item.innerHTML = `
            <span class="redflag-emoji">🚩</span>
            <span class="redflag-text">"${text}"</span>
        `;
        
        list.insertBefore(item, list.firstChild);
        console.log('✅ Red flag displayed:', text);
        
        while (list.children.length > 20) {
            list.removeChild(list.lastChild);
        }
    }

    destroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎉 L\'amour - Valentine\'s Event 2026 🎉', 'color: #FF5722; font-size: 20px; font-weight: bold;');
    
    new CountdownTimer();
    new ScrollIndicator();
    
    if (initSupabase()) {
        new RedFlagsManager();
    } else {
        console.log('⏳ Waiting for Supabase SDK...');
        setTimeout(() => {
            if (initSupabase()) {
                new RedFlagsManager();
            } else {
                console.warn('⚠️ Supabase SDK not available, using local red flags only');
                new RedFlagsManager();
            }
        }, 2000);
    }
});
