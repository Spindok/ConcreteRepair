/**
 * @jest-environment jsdom
 */

describe('script.js tests', () => {
    let scrollIntoViewMock;

    beforeEach(() => {
        document.body.innerHTML = `
            <footer><span id="year"></span></footer>
            <a href="#services" id="nav-link">Services</a>
            <div id="services"></div>
            <a href="#missing" id="missing-link">Missing</a>
        `;

        scrollIntoViewMock = jest.fn();
        window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        // Reset modules so script.js is evaluated fresh each time
        jest.resetModules();
        require('./script.js');

        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    it('should set the current year in the #year element', () => {
        const yearSpan = document.getElementById('year');
        expect(yearSpan.textContent).toBe(new Date().getFullYear().toString());
    });

    it('should prevent default and call scrollIntoView for smooth scrolling', () => {
        const navLink = document.getElementById('nav-link');

        // Mock preventDefault
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navLink.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle clicking a link with a missing target gracefully', () => {
        const missingLink = document.getElementById('missing-link');

        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        missingLink.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        // Since #missing does not exist in DOM, scrollIntoView should not be called
        expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('should handle missing #year element gracefully', () => {
        // Remove year element
        document.getElementById('year').remove();

        // Re-trigger DOMContentLoaded
        jest.resetModules();
        require('./script.js');
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });
});
