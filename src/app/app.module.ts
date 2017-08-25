import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { TweetComponent } from './tweet/tweet.component';
import { UnitableService } from './unitable.service';
import { HttpModule, JsonpModule } from '@angular/http';
import { EmojiComponent } from './emoji/emoji.component';
import { GroupfiltPipe } from './groupfilt.pipe';
import { EventBusService } from './event-bus.service';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        TweetComponent,
        EmojiComponent,
        GroupfiltPipe
    ],
    imports: [BrowserModule, FlexLayoutModule, HttpModule, JsonpModule],
    providers: [UnitableService, EventBusService],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
