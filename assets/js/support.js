(function(){
    'use strict';
    document.addEventListener('DOMContentLoaded', function () {
        try {
            const openBtn = document.getElementById('openSupport');

            let _keydownHandler = null;
            function closeModal(modal) {
                if (!modal) return;
                try {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
                    document.body.style.overflow = '';
                    if (_keydownHandler) {
                        document.removeEventListener('keydown', _keydownHandler);
                        _keydownHandler = null;
                    }
                    const openBtnRef = document.getElementById('openSupport');
                    if (openBtnRef) openBtnRef.focus();
                } catch (err) {
                    console.error('Error closing modal:', err);
                }
            }

            function createModal() {
                if (document.getElementById('supportModal')) return document.getElementById('supportModal');
                const wrapper = document.createElement('div');
                wrapper.id = 'supportModal';
                wrapper.className = 'modal';
                wrapper.setAttribute('role', 'dialog');
                wrapper.setAttribute('aria-modal', 'true');
                wrapper.setAttribute('aria-labelledby', 'modalTitle');
                wrapper.hidden = true;
                wrapper.innerHTML = `
                    <div class="modal-content" role="document">
                        <button class="modal-close" aria-label="Close dialog">×</button>
                        <h3 id="modalTitle">Contact Support</h3>
                        <form id="supportForm">
                            <label for="supportMessage" class="sr-only">Message</label>
                            <textarea id="supportMessage" name="message" rows="6" placeholder="Write your message (optional: remain anonymous)" required></textarea>
                            <div class="modal-actions">
                                <button type="submit" class="cta-btn">Send</button>
                                <button type="button" class="cta-btn secondary" id="cancelBtn">Cancel</button>
                            </div>
                        </form>
                    </div>`;

                document.body.appendChild(wrapper);

                const closeEls = wrapper.querySelectorAll('.modal-close, #cancelBtn');
                const form = wrapper.querySelector('#supportForm');

                closeEls.forEach(el => el.addEventListener('click', function () { closeModal(wrapper); }));

                wrapper.addEventListener('click', function (e) {
                    if (e.target === wrapper) closeModal(wrapper);
                });

                if (form) {
                    form.addEventListener('submit', function (e) {
                        e.preventDefault();
                        const msgEl = wrapper.querySelector('#supportMessage');
                        const msg = msgEl ? msgEl.value.trim() : '';
                        if (!msg) {
                            alert('Please enter a message.');
                            return;
                        }
                        const submitBtn = wrapper.querySelector('button[type="submit"]');
                        if (submitBtn) submitBtn.disabled = true;
                        if (submitBtn) submitBtn.textContent = 'Sending...';
                        fetch('https://formspree.io/f/mdaoknda', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: msg })
                        }).then(res => {
                            if (res.ok) {
                                // Show success message in modal
                                const content = wrapper.querySelector('.modal-content');
                                if (content) {
                                    content.innerHTML = '<div style="text-align:center; padding:40px;"><h3 style="color:#2ecc71; margin-bottom:10px;">✓ Message Sent!</h3><p>Thank you for contacting us.</p></div>';
                                }
                                setTimeout(() => closeModal(wrapper), 2000);
                            } else {
                                alert('Error sending message. Please try again.');
                                if (submitBtn) submitBtn.disabled = false;
                                if (submitBtn) submitBtn.textContent = 'Send';
                            }
                        }).catch(err => {
                            console.error('Submission error:', err);
                            alert('Error sending message. Please try again.');
                            if (submitBtn) submitBtn.disabled = false;
                            if (submitBtn) submitBtn.textContent = 'Send';
                        });
                    });
                }

                return wrapper;
            }

            function openModal() {
                const modal = createModal();
                if (!modal) return;
                modal.hidden = false;
                modal.setAttribute('aria-hidden', 'false');
                const ta = modal.querySelector('#supportMessage');
                if (ta) ta.focus();
                document.body.style.overflow = 'hidden';
                _keydownHandler = function (e) { if (e.key === 'Escape') closeModal(modal); };
                document.addEventListener('keydown', _keydownHandler);
            }

            if (openBtn) openBtn.addEventListener('click', openModal);
        } catch (err) {
            console.error('Support modal dynamic init error:', err);
        }
    });
})();
